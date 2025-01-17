# == Schema Information
#
# Table name: course_scripts
#
#  id        :integer          not null, primary key
#  course_id :integer          not null
#  script_id :integer          not null
#  position  :integer          not null
#
# Indexes
#
#  index_course_scripts_on_course_id  (course_id)
#  index_course_scripts_on_script_id  (script_id)
#

class UnitGroupUnit < ApplicationRecord
  self.table_name = 'course_scripts'

  belongs_to :unit_group, foreign_key: 'course_id', optional: true
  belongs_to :script, class_name: 'Unit', optional: true

  after_destroy_commit :update_course_json

  def update_course_json
    UnitGroup.find_by(id: course_id)&.write_serialization
  end
end
