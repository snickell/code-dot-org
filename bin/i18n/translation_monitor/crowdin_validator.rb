require_relative 'core_validator.rb'
require_relative 'data_io_helper'
require_relative '../../../lib/cdo/crowdin/client_extentions.rb'

class CrowdinValidator
  include CoreValidator
  include DataIOHelper

  CURRENT_DIR = File.dirname(__FILE__)
  CONFIG_DIR = File.join(CURRENT_DIR, 'configs')
  OUTPUT_DIR = File.join(CURRENT_DIR, 'outputs')

  CROWDIN_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'crowdin_v2_credential.json')
  GOOGLE_DRIVE_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'google_drive_credential.json')
  CONFIG_FILE = File.join(CONFIG_DIR, 'crowdin_validator_config.json')
  HISTORY_FILE = File.join(CONFIG_DIR, 'crowdin_validator_history.json')
  LANGUAGE_FILE = File.join(CONFIG_DIR, 'crowdin_validator_languages.json')

  REQUIRED_CONFIG_PARAMS = %w[
    user_name
    project_name
    crowdin_language_id
    start_date
  ]

  DATE_FORMAT = '%Y-%m-%d'

  SourceString = Struct.new(:id, :project_id, :file_id, :identifier, :text, :is_hidden, :is_icu, :created_at, :updated_at, keyword_init: true)
  Translation = Struct.new(:id, :string_id, :text, :crowdin_language_id, :user_id, :user_name, :created_at, keyword_init: true)

  def initialize(credential_file = CROWDIN_CREDENTIAL_FILE)
    api_token = read_from_json(credential_file)["api_token"]
    @crowdin_client = Crowdin::Client.new do |config|
      config.api_token = api_token
    end
    Dir.mkdir(OUTPUT_DIR) unless Dir.exist?(OUTPUT_DIR)
  end

  # Load and run all configurations from a config file.
  # May combine with a history file to skip already processed data.
  #
  # This function has side effects. It may write to the local file system and Google Drive.
  #
  # @param config_file [String]
  # @param history_file [String]
  # @param update_history [Boolean]
  # @param download_from_crowdin [Boolean]
  #
  def run_all_configs(config_file:, history_file: nil, update_history: false, download_from_crowdin: true)
    configs = load_configs(config_file)

    # Update configs using the history of last successful runs
    history = {}
    if history_file
      history = read_from_json(history_file) if File.exist?(history_file)
      merge_configs_and_history(configs, history)
    end

    # Execute all configs, one by one
    configs.each do |config|
      puts '=' * 50
      puts "Executing config: #{config}"

      begin
        translations, source_strings, errors = run_config(config, download_from_crowdin)

        # Update the history of last successful runs
        if history_file && update_history
          config_with_results = config.merge(
            {
              'results' => {
                'translation_count' => translations.size,
                'source_string_count' => source_strings.size,
                'error_count' => errors.size
              }
            }
          )
          key = create_history_key(config)
          history[key] = config_with_results
          write_to_json(history, history_file)
        end
      rescue Exception => e
        puts "Error: #{e.message}"
        puts e.backtrace
      end
    end
  end

  # Run a single configuration.
  #
  # This function has side effects. It updates the +config+ input.
  # It may write to the local file system and Google Drive.
  #
  # @param config [Hash]
  # @param download_from_crowdin [Boolean] downloading data from Crowdin or reading data from the local file system
  # @return [Array<Array>] array of translations, source_strings, and translation errors
  #
  def run_config(config, download_from_crowdin)
    missing_params = find_missing_params(config, REQUIRED_CONFIG_PARAMS)
    raise "Missing config params #{missing_params}" unless missing_params.empty?
    infer_config_params(config)

    # Retreive translations
    if download_from_crowdin
      translations = @crowdin_client.download_translations(
        config['project_name'],
        config['crowdin_language_id'],
        config['user_name'],
        config['start_date'],
        config['end_date']
      )
      if config['write_to_file']
        write_to_json(translations, config['translations_json'])
        puts "Wrote #{translations.size} translations to #{config['translations_json']}"
      end
    else
      translations = read_from_json(config['translations_json'])
    end

    # Retreive source strings
    if download_from_crowdin
      source_strings = @crowdin_client.download_source_strings(
        config['project_name'],
        config['crowdin_language_id'],
        config['user_name'],
        config['start_date'],
        config['end_date']
      )
      if config['write_to_file']
        write_to_json(source_strings, config['source_strings_json'])
        puts "Wrote #{source_strings.size} source strings to #{config['source_strings_json']}"
      end
    else
      source_strings = read_from_json(config['source_strings_json'])
    end

    # Find all translation errors
    errors = validate_all_translations(translations, source_strings)
    error_rows = convert_to_csv_rows(errors)

    if config['write_to_file']
      write_to_json errors, config['errors_json']
      puts "Wrote #{errors.size} errors to #{config['errors_json']}"
      write_to_csv error_rows, config['errors_csv']
      puts "Wrote #{errors.size} errors to #{config['errors_csv']}"
    end
    if config['write_to_gsheet']
      write_to_gsheet error_rows, config['errors_gsheet'], config['crowdin_language_id'], GOOGLE_DRIVE_CREDENTIAL_FILE
      puts "Wrote #{errors.size} errors to #{config['errors_gsheet']} gsheet"
    end

    [translations, source_strings, errors]
  end

  private

  def load_configs(config_file)
    configs = read_from_json(config_file)
    shared_data = configs['shared_data']
    data = configs['data']
    limit = configs['limit'] || data.size
    limit.times.map do |i|
      # The more specifc data will overwrite the shared data
      shared_data.merge(data[i])
    end
  end

  # Use history of the last successful runs to update the +congfigs+ input.
  # @param configs [Array<Hash>]
  # @param history [Hash]
  def merge_configs_and_history(configs, history)
    configs.each do |config|
      key = create_history_key(config)
      last_successful_date = history.dig(key, 'end_date')
      config['start_date'] = last_successful_date if last_successful_date
    end
  end

  # Create a key that will be used in the history file.
  # @param config [Hash]
  # @return [String]
  def create_history_key(config)
    values = %w[user_name project_name crowdin_language_id]
    config.values_at(*values).join('_')
  end

  # Create a key that will be used to create unique output files.
  # @param config [Hash]
  # @return [String]
  def create_config_key(config)
    values = %w[user_name project_name crowdin_language_id start_date end_date]
    config.values_at(*values).join('_')
  end

  # @param input_hash [Hash]
  # @param required_params [Array<String>]
  # @return [Array<String>]
  def find_missing_params(input_hash, required_params)
    required_params.select do |param|
      input_hash[param].nil? || input_hash[param].empty?
    end
  end

  # Update the +config+ input with inferred date and output params.
  # @param config [Hash]
  def infer_config_params(config)
    config['end_date'] ||= DateTime.now.utc.strftime(DATE_FORMAT)

    # local file outputs
    output_folder = config['output_folder'] || OUTPUT_DIR
    output_prefix = "#{output_folder}/#{create_config_key(config)}"
    config['translations_json'] ||= "#{output_prefix}_translations.json"
    config['source_strings_json'] ||= "#{output_prefix}_source_strings.json"
    config['errors_json'] ||= "#{output_prefix}_errors.json"
    config['errors_csv'] ||= "#{output_prefix}_errors.csv"

    # gsheet output
    gsheet_path = "#{config['user_name']}_#{config['project_name']}"
    config['errors_gsheet'] ||= gsheet_path
  end

  # @param translations [Hash]
  # @param source_strings [Hash]
  # @return [Array<Hash>] array of translation errors
  def validate_all_translations(translations, source_strings)
    transformed_translations = transform_translations(translations)
    transformed_source_strings = transform_source_strings(source_strings)

    # Match translations to their source strings, then validate them
    errors = []
    transformed_translations.each_pair do |str_id, str_translations|
      source_string = transformed_source_strings[str_id]
      str_translations.each_value do |str_translation|
        errors.concat(validate_translation(str_translation, source_string))
      end
    end

    puts "Found #{errors.size} errors!"
    errors
  end

  # @param source [SourceString]
  # @param translation [Translation]
  # @return [Array<Hash>] array of translation errors
  def validate_translation(translation, source)
    # Validate redaction blocks
    error_messages = []
    error_messages << validate_redacted_blocks(translation.text)

    # Validate markdown content
    error_messages << validate_markdown_link(translation.text)

    # Validate translation language
    languages = load_languages
    accepted_languages = languages[translation.crowdin_language_id]['language_detector_code'] || translation.crowdin_language_id
    error_messages << validate_language(translation.text, accepted_languages)

    # Combine error messages found by the validation functions with
    # other useful information to help translators fixing errors faster.
    crowdin_editor_code = languages[translation.crowdin_language_id]['editor_code']
    project_name = Crowdin::Client::CDO_PROJECT_IDS.key(source.project_id)
    project_source_language = Crowdin::Client::CDO_PROJECT_SOURCE_LANGUAGES[project_name]
    crowdin_link = "https://crowdin.com/translate/#{project_name}/#{source.file_id}/#{project_source_language}-#{crowdin_editor_code}##{source.id}"
    common_info = {
      string_id: source.id,
      string: source.text,
      string_created_at: source.created_at,
      translation_id: translation.id,
      translation: translation.text,
      translator_id: translation.user_id,
      translator_user_name: translation.user_name,
      translation_created_at: translation.created_at,
      crowdin_link: crowdin_link
    }

    [].tap do |errors|
      error_messages.each do |error_message|
        next if error_message.nil? || error_message.empty?
        errors << common_info.merge({error_message: error_message}) unless error_message.empty?
      end
    end
  end

  # Transform an array of translation to a hash for faster lookup.
  # @param translations [Array<Hash>]
  # @return [Hash{string_id => Hash{translation_id => Translation}}]
  def transform_translations(translations)
    {}.tap do |res|
      translations.each do |data|
        string_id = data['stringId']
        translation_id = data['translationId']
        user_id = data.dig('user', 'id')
        raise 'string_id must not be nil' if string_id.nil?
        raise 'translation_id must not be nil' if translation_id.nil?
        raise 'user_id must not be nil' if user_id.nil?

        res[string_id] ||= {}
        res[string_id][translation_id] = Translation.new(
          id: translation_id,
          string_id: string_id,
          text: data['text'],
          crowdin_language_id: data['crowdin_language_id'],
          user_id: user_id,
          user_name: data.dig('user', 'username'),
          created_at: data['createdAt']
        )
      end
    end
  end

  # Transform an array of source strings to a hash for faster lookup.
  # @param source_strings [Array<Hash>]
  # @return [Hash{string_id => SourceString}]
  def transform_source_strings(source_strings)
    {}.tap do |res|
      source_strings.each do |data|
        string_id = data['id']
        raise 'string_id must not be nil' if string_id.nil?

        res[string_id] = SourceString.new(
          id: string_id,
          project_id: data['projectId'],
          file_id: data['fileId'],
          identifier: data['identifier'],
          text: data['text'],
          is_hidden: data['isHidden'],
          is_icu: data['isIcu'],
          created_at: data['createdAt'],
          updated_at: data['updatedAt']
        )
      end
    end
  end

  # Load language mapping
  def load_languages(file_name = LANGUAGE_FILE)
    @languages = read_from_json(file_name) if @languages.nil? && File.exist?(file_name)
    @languages
  end
end
