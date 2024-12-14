#!/usr/bin/env ruby

require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../course_offerings'

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            tms_file_path = I18nScriptUtils.tms_locale_dir(language[:locale_s], FILE_PATH)
            return unless File.file?(tms_file_path)

            i18n_locale = language[:locale_s]
            distribute_localization(i18n_locale, tms_file_path)

            i18n_file_path = I18nScriptUtils.locale_dir(i18n_locale, FILE_PATH)
            I18nScriptUtils.move_file(tms_file_path, i18n_file_path)
            I18nScriptUtils.remove_empty_dir File.dirname(tms_file_path)
          end

          private def distribute_localization(i18n_locale, tms_file_path)
            tms_translations = JSON.load_file(tms_file_path)

            i18n_data = I18nScriptUtils.to_dashboard_i18n_data(i18n_locale, 'course_offerings', tms_translations)
            target_i18n_file_path = CDO.dir('dashboard/config/locales', "course_offerings.#{i18n_locale}.json")

            I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseOfferings::SyncOut.perform if __FILE__ == $0
