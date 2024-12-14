#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../redact_restore_utils'
require_relative '../scripts'

module I18n
  module Resources
    module Dashboard
      module Scripts
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            tms_file_path = tms_file_path_of(language)
            return unless File.file?(tms_file_path)

            restore_localization(language)
            report_malformed_i18n(language)
            distribute_localization(language)

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], FILE_PATH)
            I18nScriptUtils.move_file(tms_file_path, i18n_file_path)
            I18nScriptUtils.remove_empty_dir File.dirname(tms_file_path)
          end

          private def tms_file_path_of(language)
            I18nScriptUtils.tms_locale_dir(language[:locale_s], FILE_PATH)
          end

          private def restore_localization(language)
            tms_file_path = tms_file_path_of(language)

            RedactRestoreUtils.restore(
              I18N_BACKUP_FILE_PATH,
              tms_file_path,
              tms_file_path,
              REDACT_PLUGINS,
              REDACT_FORMAT
            )
          end

          private def report_malformed_i18n(language)
            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(language[:locale_s])
            malformed_i18n_reporter.process_file(tms_file_path_of(language))
            malformed_i18n_reporter.report
          end

          private def distribute_localization(language)
            target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "scripts.#{language[:locale_s]}.yml")
            I18nScriptUtils.sanitize_file_and_write(tms_file_path_of(language), target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Scripts::SyncOut.perform if __FILE__ == $0
