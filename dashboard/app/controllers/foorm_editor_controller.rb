# Foorm Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
class FoormEditorController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  before_action :authenticate_user!
  authorize_resource class: false

  # GET '/foorm/editor/'
  def index
    formatted_names_and_versions = Foorm::Form.all.map {|form| {name: form.name, version: form.version, id: form.id}}
    categories = formatted_names_and_versions.map {|data| data[:name].slice(0, data[:name].rindex('/'))}.uniq

    @script_data = {
      props: {
        formNamesAndVersions: formatted_names_and_versions,
        formCategories: categories
      }.to_json
    }

    render 'foorm/editor/index'
  end
end
