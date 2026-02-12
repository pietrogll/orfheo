# frozen_string_literal: true

module Helpers
  def is_false?
    self == false || self == 'false'
  end

  def is_true?
    self == true || self == 'true'
  end
end

class Object
  include Helpers
end
