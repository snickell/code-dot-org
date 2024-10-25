class UpdateCensusSummarySchoolYearName < ActiveRecord::Migration[6.1]
  def change
    rename_column :census_summaries, :school_year, :access_report_year
  end
end
