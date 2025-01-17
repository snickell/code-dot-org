require "ostruct"
require_relative '../../../../../lib/cdo/shared_constants'

module Config
  # Configuration for each endpoint used in the Gen AI Curriculum. Required properties:
  #   hf_model_id: HuggingFace model ID
  #   model_id: App-wide model ID (from shared constants)
  #   model_name: Short name for naming resources (alphanumeric only)
  #   instance_type: EC2 Instance Type for endpoint
  #   min_num_instances (production only): Minimum number of deployed instances used for autoscaling on production
  #     on test, only a single instance will be used without autoscaling to limit resource usage
  #   max_num_instances (production only): Maximum number of deployed instances used for autoscaling on production
  #     not used on test
  #   autoscaling_target_value (production only): Number of requests / minute at which autoscaling starts to take effect
  #     not used on test
  AVAILABILITY_ZONES = [
    'us-east-2a',
    'us-east-2b'
  ].freeze
end
