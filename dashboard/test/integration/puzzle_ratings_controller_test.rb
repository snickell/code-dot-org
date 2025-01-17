require 'test_helper'

class PuzzleRatingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    PuzzleRating.stubs(:enabled?).returns true
    @student = create :student
    @script = create :script
  end

  test 'creation requires script, level, and rating' do
    level = create :level

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: {}, as: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: {script_id: @script.id}, as: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: {level_id: level.id}, as: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: {rating: 0}, as: :json
    end
    assert_response :bad_request

    assert_creates(PuzzleRating) do
      post puzzle_ratings_path, params: {
        script_id: @script.id,
        level_id: level.id,
        rating: 0
      }, as: :json
    end
    assert_response :created
  end

  test 'rating must be 0 or 1' do
    level = create :level

    [nil, 0.5, 2, -1].each do |bad_rating|
      assert_does_not_create(PuzzleRating) do
        post puzzle_ratings_path, params: {
          script_id: @script.id,
          level_id: level.id,
          rating: bad_rating
        }, as: :json
      end
      assert_response :bad_request
    end

    [0, 1].each do |good_rating|
      assert_creates(PuzzleRating) do
        post puzzle_ratings_path, params: {
          script_id: @script.id,
          level_id: level.id,
          rating: good_rating
        }, as: :json
      end
      assert_response :created
    end
  end

  test 'logged-in user can create uniquely only once' do
    sign_in @student

    level = create :level

    params = {
      script_id: @script.id,
      level_id: level.id,
      rating: 1
    }

    assert_creates(PuzzleRating) do
      post puzzle_ratings_path, params: params, as: :json
    end

    assert_response :created

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: params, as: :json
    end

    assert_response :bad_request
  end

  test 'anonymous user can create many' do
    level = create :level

    params = {
      script_id: @script.id,
      level_id: level.id,
      rating: 1
    }

    assert_creates(PuzzleRating) do
      post puzzle_ratings_path, params: params, as: :json
    end

    assert_response :created

    assert_creates(PuzzleRating) do
      post puzzle_ratings_path, params: params, as: :json
    end

    assert_response :created
  end

  test 'can be disabled' do
    PuzzleRating.stubs(:enabled?).returns false

    level = create :level

    params = {
      script_id: @script.id,
      level_id: level.id,
      rating: 1
    }

    assert_does_not_create(PuzzleRating) do
      post puzzle_ratings_path, params: params, as: :json
    end

    assert_response :unauthorized
  end
end
