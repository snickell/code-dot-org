class AddAppToBlocks < ActiveRecord::Migration[4.2]
  def change
    add_column :blocks, :app, :string
  end
end
