require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class ObjectTest < Minitest::Test
  def test_nil_or_empty
    assert(nil.nil_or_empty?)
    assert(''.nil_or_empty?)
    assert([].nil_or_empty?)
    assert({}.nil_or_empty?)

    refute('a'.nil_or_empty?)
    refute([1].nil_or_empty?)
    refute({a: 1}.nil_or_empty?)
  end
end
