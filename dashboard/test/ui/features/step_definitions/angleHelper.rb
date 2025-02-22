When(/^I drag the Angle Helper circle to coordinates \((\d*),(\d*)\)$/) do |x, y|
  script = <<-JS
      const element = document.querySelector('.blocklyAngleHelperContainer svg');
      const rect = element.getBoundingClientRect();
      const startX = rect.left + window.scrollX;
      const startY = rect.top + window.scrollY;
      const endX = startX + #{x};
      const endY = startY + #{y};

      const createAndDispatchEvent = (type, clientX, clientY) => {
          const event = new MouseEvent(type, {
              clientX: clientX,
              clientY: clientY
          });
          element.dispatchEvent(event);
      };

      createAndDispatchEvent('mousedown', startX, startY);
      createAndDispatchEvent('mousemove', endX, endY);
      createAndDispatchEvent('mouseup', endX, endY);
  JS

  @browser.execute_script(script)
end

Then(/^the angle text is at "(\d*)"$/) do |val|
  val_int = val.to_i
  # Firefox and Chrome are off by one in the pixel location of the angle text, so we need to allow for a small range in values.
  expect(@browser.execute_script("return $('.blocklyWidgetDiv .blocklyHtmlInput').val()").to_i).to be_between(val_int - 1, val_int + 1)
end

Then(/^the angle dropdown is at "(\d*)"$/) do |val|
  expect(@browser.execute_script("return $('.blocklyMenuItemSelected > .blocklyMenuItemContent').text()")).to eq(val)
end

Then(/^the Angle Helper circle is at coordinates \((\d*),(\d*)\)$/) do |x, y|
  # use a short timeout to accomodate the smoothing animation on the
  # angle helper circle
  wait_short_until do
    @browser.execute_script("return parseInt(($('.blocklyAngleHelperContainer circle')[1]).getAttribute('cx')) === #{x};")
    @browser.execute_script("return parseInt(($('.blocklyAngleHelperContainer circle')[1]).getAttribute('cy')) === #{y};")
  end
end
