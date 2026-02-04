# Scopify concern - provides dynamic parameter accessor methods
# Ported from controllers/base.rb helper

module Scopify
  extend ActiveSupport::Concern

  class_methods do
    # Define parameter accessor methods dynamically at class level
    # Example: scopify :event_id, :signature
    # Creates methods: event_id() and signature() that return params[:event_id] and params[:signature]
    def scopify(*param_projection)
      param_projection.each do |param|
        define_method(param) do
          # Handle both Sinatra-style @params and Rails params
          if defined?(@params) && @params
            @params[param]
          elsif respond_to?(:symbolized_params)
            symbolized_params[param]
          else
            params[param]
          end
        end
      end
    end
  end

  # Instance method version for use inside actions (Sinatra-style)
  # Example: scopify :email, :password
  # Creates accessor methods on the fly for the current request
  def scopify(*param_projection)
    param_projection.each do |param|
      singleton_class.define_method(param) do
        @params&.[](param) || params[param]
      end
    end
  end
end
