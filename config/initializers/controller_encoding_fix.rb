# Rails 8.1 compatibility fix for action_encoding_template
# This method needs to be defined on controller classes at load time

# Monkey-patch Module to add the method when a controller inherits from ActionController::Base
Module.class_eval do
  alias_method :original_inherited, :inherited if method_defined?(:inherited)

  def inherited(subclass)
    original_inherited(subclass) if respond_to?(:original_inherited)

    if self == ActionController::Base || (self < ActionController::Base rescue false)
      subclass.define_singleton_method(:action_encoding_template) do |action_name|
        'utf-8'  # Return encoding name as string
      end
    end
  end
end

# Also patch existing controllers that are already loaded
Rails.application.config.after_initialize do
  [ApplicationController, EventsController, ProgramsController, ActivitiesController].each do |klass|
    next unless defined?(klass)

    klass.define_singleton_method(:action_encoding_template) do |action_name|
      'utf-8'  # Return encoding name as string
    end
  end
end
