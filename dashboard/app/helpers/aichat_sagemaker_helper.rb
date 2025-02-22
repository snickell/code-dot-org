module AichatSagemakerHelper
  MAX_NEW_TOKENS = 512
  TOP_P = 0.9

  def self.create_sagemaker_client
    # Stubbed SageMaker allows UI tests (without the roundtrip to the model) to run in CI environments
    Rails.application.config.respond_to?(:stub_aichat_aws_services) && Rails.application.config.stub_aichat_aws_services ?
      StubbedSagemakerClient.new :
      Aws::SageMakerRuntime::Client.new
  end

  def self.get_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions = level_system_prompt + " " unless level_system_prompt.empty?
    instructions << (system_prompt + " ") unless system_prompt.empty?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts
    instructions
  end

  def self.format_inputs_for_sagemaker_request(aichat_model_customizations, stored_messages, new_message, level_id)
    selected_model_id = aichat_model_customizations['selectedModelId']
    # Add system prompt and retrieval contexts if available to inputs as part of instructions that will be sent to model.
    # Get level system prompt that will be prepended to student system prompt.
    level_system_prompt = Level.find_by(id: level_id)&.properties&.dig('aichat_settings', 'levelSystemPrompt') || ""
    instructions = get_instructions(aichat_model_customizations['systemPrompt'], level_system_prompt, aichat_model_customizations['retrievalContexts'])
    model_processor = get_model_processor(selected_model_id)
    inputs = model_processor.format_model_inputs(instructions, new_message, stored_messages)
    stopping_strings = model_processor.get_stop_strings

    {
      inputs: inputs,
      parameters: {
        temperature: aichat_model_customizations['temperature'].to_f,
        max_new_tokens: MAX_NEW_TOKENS,
        top_p: TOP_P,
        stop: stopping_strings,
      }
    }
  end

  def self.get_model_processor(selected_model_id)
    case selected_model_id
    when SharedConstants::AI_CHAT_MODEL_IDS[:PIRATE]
      return AiModelProcessors::PirateProcessor.new
    when SharedConstants::AI_CHAT_MODEL_IDS[:KAREN]
      return AiModelProcessors::KarenProcessor.new
    when SharedConstants::AI_CHAT_MODEL_IDS[:ARITHMO]
      return AiModelProcessors::ArithmoProcessor.new
    else
      return AiModelProcessors::MistralProcessor.new
    end
  end

  def self.request_sagemaker_chat_completion(inputs, selected_model_id)
    create_sagemaker_client.invoke_endpoint(
      endpoint_name: get_endpoint_name(selected_model_id), # required
      body: inputs.to_json, # required
      content_type: "application/json"
    )
  end

  def self.get_sagemaker_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id)
    inputs = format_inputs_for_sagemaker_request(aichat_model_customizations, stored_messages, new_message, level_id)
    selected_model_id = aichat_model_customizations['selectedModelId']
    sagemaker_response = request_sagemaker_chat_completion(inputs, selected_model_id)
    parsed_response = JSON.parse(sagemaker_response.body.string)
    generated_text = parsed_response[0]["generated_text"]
    model_processor = get_model_processor(selected_model_id)
    model_processor.format_model_output(generated_text)
  end

  def self.can_request_aichat_chat_completion?
    DCDO.get("aichat_chat_completion", true)
  end

  def self.get_endpoint_name(model_id)
    "#{model_id}-#{rack_env?(:production) ? 'production' : 'test'}"
  end
end

# Classes that allow us to stub Sagemaker in CI, which does not have permission to access SageMaker.
class StubbedSagemakerClient
  def invoke_endpoint(_)
    StubbedSagemakerResponse.new
  end
end

class StubbedSagemakerResponse
  def body
    StubbedSagemakerResponseBody.new
  end
end

class StubbedSagemakerResponseBody
  def string
    JSON.generate([{"generated_text" => "Hello there!"}])
  end
end
