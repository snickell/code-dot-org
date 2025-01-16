class StudentCodeSamplesController < ApplicationController
  def fetch_student_code_samples
    level_id = params[:level_id]
    script_id = params[:script_id]
    num_samples = params[:num_samples].to_i

    s3 = Aws::S3::Client.new
    bucket = CDO.sources_s3_bucket
    base_dir = CDO.sources_s3_directory
    # We want to pull samples from students who have been assigned to work on the level.
    sections = Section.where(script_id: params[:script_id].to_i)
    student_ids = Follower.where(section: sections).pluck(:student_user_id)
    code_samples = []
    until code_samples.length == num_samples
      student_ids.each do |student_id|
        storage_id = storage_id_for_user_id(student_id)
        channel_token = ChannelToken.where(storage_id: storage_id, level_id: params[:level_id], script_id: params[:script_id]).last
        user_level = UserLevel.where(user_id: student_id, level_id: params[:level_id], script_id: params[:script_id]).last
        if user_level && channel_token
          storage_app_id = channel_token.storage_app_id
          token = storage_encrypt_channel_id(storage_id, storage_app_id)
          _owner_storage_id, project_id = storage_decrypt_channel_id(token)
          s3_filename = "#{base_dir}/#{storage_id}/#{project_id}/main.json"
          body = s3.get_object(bucket: bucket, key: s3_filename)[:body].read
          student_code = JSON.parse(body)['source'] if body
          code_samples << {level_id: level_id, script_id: script_id, user_id: student_id, project_id: token, student_code: student_code}
        end
      end
    end
    render json: code_samples
  end
end
