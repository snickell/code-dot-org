require 'set'

class LevelLoader
  # Top-level entry point, called by rake seed:custom_levels
  def self.load_custom_levels(level_name, root_dir)
    import_levels(Policies::LevelFiles.level_file_glob(level_name, root_dir))
  end

  #
  # Loads a group of level files from disk and imports them into the database.
  #
  # - Level files not found in the database will be created.
  # - Level files found in the database will be updated if they don't match the
  #   file as loaded from disk.
  #
  # @param [String] level_file_glob - dashboard-relative, wildcard-friendly path
  #   to one or more .level files.
  def self.import_levels(level_file_glob)
    level_file_paths = file_paths_from_glob(level_file_glob)

    unless level_file_paths.any?
      raise 'No matching level names found. Please check level name for exact case and spelling.'
    end

    Level.transaction do
      level_md5s_by_name = Level.pluck(:name, :md5).to_h
      existing_level_names = level_md5s_by_name.keys.to_set

      level_file_names = level_file_paths.map do |path|
        Policies::LevelFiles.level_name_from_path(path)
      end

      if level_file_names.include? 'blockly'
        raise 'Custom levels must not be named "blockly"'
      end

      # Save stubs of new levels in smaller batches.
      new_level_names = level_file_names.reject {|name| existing_level_names.include? name}
      batch_process(new_level_names, 1000) do |batch|
        Level.import!(batch.map {|name| {name: name}})
      end

      # Load level properties from disk and identify changed levels.
      changed_levels = level_file_paths.filter_map do |path|
        Services::LevelFiles.load_custom_level(path, level_md5s_by_name)
      end.select(&:changed?)

      if [:development, :adhoc].include?(rack_env) && !CDO.properties_encryption_key
        puts "WARNING: Skipping encrypted levels because CDO.properties_encryption_key is not defined."
        changed_levels.reject!(&:encrypted?)
      end

      raise_if_dsl_defined_levels(changed_levels)

      # Process associated LevelConceptDifficulty models in smaller batches.
      immutable_lcd_columns = %i[id level_id created_at]
      changed_lcds = changed_levels.filter_map(&:level_concept_difficulty)
      lcd_update_columns = LevelConceptDifficulty.columns.map(&:name).map(&:to_sym) - immutable_lcd_columns
      batch_process(changed_lcds, 1000) do |batch|
        LevelConceptDifficulty.import! batch, on_duplicate_key_update: lcd_update_columns
      end

      # Trigger necessary callbacks manually.
      changed_levels.each do |level|
        level.run_callbacks(:save) {false}
        level.run_callbacks(:create) {false}
      end

      # Import changed levels in smaller batches, with size checks.
      immutable_level_columns = %i[id name created_at]
      update_columns = Level.columns.map(&:name).map(&:to_sym) - immutable_level_columns
      batch_process(changed_levels.sort_by(&:id), 50) do |batch|
        total_size = batch.sum {|level| Marshal.dump(level).bytesize}
        Rails.logger.info("Importing batch of #{batch.size} levels (Total size: #{total_size} bytes)")
        Level.import! batch, on_duplicate_key_update: update_columns
      rescue ActiveRecord::Import::ValueSetTooLargeError => exception
        Rails.logger.error("Batch too large: #{exception.message}, splitting further")
        batch.each_slice(25) do |smaller_batch|
          retry_import(smaller_batch, update_columns)
        end
      end

      # Run specific after_save callbacks for child levels.
      Level.setup_child_levels_for(changed_levels, ParentLevelsChildLevel::CONTAINED)
      Level.setup_child_levels_for(changed_levels, ParentLevelsChildLevel::PROJECT_TEMPLATE)
    end
  end

  private_class_method def self.file_paths_from_glob(glob)
    Dir.glob(Rails.root.join(glob)).sort
  end

  private_class_method def self.batch_process(items, batch_size, &block)
    items.each_slice(batch_size, &block)
  end

  private_class_method def self.raise_if_dsl_defined_levels(levels)
    dsl_levels = levels.select {|l| l.is_a? DSLDefined}
    if dsl_levels.any?
      raise "Cannot define DSLDefined level types in .level files: #{dsl_levels.map {|l| "#{l.name}.level".dump}.join(',')}"
    end
  end

  private_class_method def self.retry_import(batch, update_columns)
    Level.import! batch, on_duplicate_key_update: update_columns
  rescue ActiveRecord::Import::ValueSetTooLargeError => exception
    Rails.logger.error("Retry smaller batch also failed: #{exception.message}")
  end
end
