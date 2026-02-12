# frozen_string_literal: true

module WorkersServices
  class Status
    MODULE_WITH_CLASS_METHODS = Sidekiq::Status
    CLASS_METHODS = %i[get get_all delete unschedule at total message status retrying? complete?
                       stopped? failed? interrupted? queued? working?].freeze

    class << self
      CLASS_METHODS.each do |meth|
        define_method(meth) do |*args|
          MODULE_WITH_CLASS_METHODS.send(meth, *args)
        end
      end
    end
  end
end
