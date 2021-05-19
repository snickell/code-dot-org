require 'test_helper'

class Api::V1::MlModelsControllerTest < ::ActionController::TestCase
  setup do
    AWS::S3.stubs(:delete_from_bucket).returns(true)
    AWS::S3.stubs(:upload_to_bucket).returns(true)
    @owner = create :student
    @model = create :user_ml_model, user: @owner
    @not_owner = create :student
    @params_ml_model = {
      "name" => "venom breath",
      "datasetDetails" => {
        "description" => "description.",
        "numRows" => 101
      },
      "selectedTrainer" => "knnClassify",
      "featureNumberKey" => {
        "Breathes" => {
          "Yes" => 0,
          "No" => 1
        },
      "Venomous" => {
        "No" => 0,
        "Yes" => 1
      }
      },
      "label" => {
        "id" => "Venomous",
        "description" => "Is the animal venomous?",
        "values" => %w[No Yes]
      },
      "features" => [{"id" => "Breathes",
                      "description" => "Does the animal breathe?",
                      "values" => %w[Yes No]}],
      "summaryStat" => {"type" => "classification",
                        "stat" => "90.00"},
      "trainedModel" => {"name" => "KNN"}
    }
  end

  # Tests for the Destroy controller action.
  test 'user can not delete non-existant models' do
    sign_in @owner
    delete :destroy, params: {id: "fakeId"}
    assert_response :not_found
  end

  test 'user can delete own model' do
    sign_in @owner
    delete :destroy, params: {id: @model.model_id}
    assert_response :success
  end

  test 'user can not delete models they do not own' do
    sign_in @not_owner
    delete :destroy, params: {id: @model.model_id}
    assert_response :forbidden
  end

  # Tests for the Save controller action.
  test 'user can successfully save an ML model' do
    sign_in @owner
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => @params_ml_model}
    end
    assert_response :success
  end

  test 'returns a failure when saving a nonexistent model' do
    sign_in @owner
    # nil => {}
    post :save, params: nil
    assert_response :bad_request
  end

  test 'returns a failure when saving a model with invalid data' do
    sign_in @owner
    # {"ml_model" => nil} => {"ml_model" => ""}
    post :save, params: {"ml_model" => nil}
    assert_response :bad_request
  end

  test 'returns failure when model cannot save' do
    sign_in @owner
    post :save, params: {"ml_model" => {"name" => nil}}
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  test 'returns failure when model saves to database but not S3' do
    sign_in @owner
    AWS::S3.stubs(:upload_to_bucket).returns(nil)
    assert_difference('UserMlModel.count', 1) do
      post :save, params: {"ml_model" => @params_ml_model}
    end
    assert_equal "failure", JSON.parse(@response.body)["status"]
  end

  # Tests for the Names controller action.
  test 'user can retrieve names, ids, and metadata of trained ML models' do
    database_model_names = []
    api_model_names = []
    sign_in @owner
    create_list(:user_ml_model, 2)

    # call DB directly
    expected_user_ml_model_data = UserMlModel.where(user_id: @owner&.id).
      map {|user_ml_model| { id: user_ml_model.model_id, name: user_ml_model.name, metadata: JSON.parse(user_ml_model.metadata)}}

    JSON.parse(expected_user_ml_model_data.to_json).each do |model|
      database_model_names << model["name"]
    end
    get :names
    # response from API
    JSON.parse(@response.body).each do |model|
      api_model_names << model["name"]
    end

    assert_equal api_model_names, database_model_names
    assert_response :success
  end

  test 'retrieve the metadata of a trained ML model' do
    sign_in @owner
    get :metadata, params: {id: @model.model_id}
    metadata = UserMlModel.where(model_id: @model.model_id)&.first&.metadata
    assert_response :success
  end

  # test 'renders 404 if model does not exist' do
  #   sign_in @owner
  #   AWS::S3.stubs(:download_from_bucket).returns(nil)
  #   get :show, params: {id: nil}
  #   puts @response
  #   assert_response :not_found
  # end
end
