require 'eyes_selenium'

When(/^I open my eyes to test "([^"]*)"$/) do |test_name|
  ensure_eyes_available
  @original_browser = @browser
  @browser = @eyes.open(app_name: 'Code.org', test_name: test_name, driver: @browser)
end

And(/^I close my eyes$/) do
  @browser = @original_browser
  @eyes.close
end

And(/^I see no difference for "([^"]*)"$/) do |identifier|
  @eyes.check_window(identifier)
end

def ensure_eyes_available
  return if @eyes
  @eyes = Applitools::Eyes.new
  @eyes.api_key = CDO.applitools_eyes_api_key
end
