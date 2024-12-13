#!/usr/bin/env ruby
require 'fileutils'

# Script to remove all translations from the working branch.

apps_dir = './apps/i18n'
dashboard_dir = './dashboard/config/locales'
i18n_dir = './i18n/locales'

# Clearing translations from apps directory
Dir.glob(File.join(apps_dir, '*', '*.json')) do |apps_file|
  locale = File.basename(apps_file, '.json')
  next if locale == 'en_us'
  FileUtils.rm(apps_file)
end

# Clearing translations from dashboard directory
Dir.glob(File.join(dashboard_dir, '*.{json,yml}')) do |dashboard_file|
  file_name = File.basename(dashboard_file)
  locale = file_name.split('.')[-2]
  next if locale == 'en'
  FileUtils.rm(dashboard_file)
end

# Clearing Synced down translations from i18n directory
Dir.glob(File.join(i18n_dir, '*-[A-Z][A-Z]*')) do |locale_dir|
  FileUtils.rm_r(locale_dir)
end
