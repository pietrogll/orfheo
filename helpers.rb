module Helpers

	# class << self
	
	def is_false?
    self == false || self == 'false'
  end

  
  def is_true?
    self == true || self == 'true'
  end

  # def is_falsy?
  #   self == false || self == 'false' || self.nil? || self.empty?
  # end

end

class Object
	include Helpers
end