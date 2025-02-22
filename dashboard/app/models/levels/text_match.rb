# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#

# Text Match type.
class TextMatch < DSLDefined
  def dsl_default
    <<~RUBY
      name 'Enter name here'
      title 'Enter title here'
      content1 'Enter prompt here'
      answer 'Enter answer here'
    RUBY
  end

  def supports_markdown?
    true
  end

  def icon
    'fa fa-list-ul'
  end

  def validated?
    true
  end
end
