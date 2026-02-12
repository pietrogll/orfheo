# frozen_string_literal: true

module Services
  class Encryptor
    class << self
      def encrypt(a_string)
        ENCRYPTOR.encrypt a_string
      end

      def check_equality(string_encrypted, a_string)
        ENCRYPTOR.check_equality string_encrypted, a_string
      end
    end

    class BcryptEncriptor
      class << self
        def encrypt(a_string)
          BCrypt::Password.create a_string
        end

        def check_equality(string_encrypted, a_string)
          BCrypt::Password.new(string_encrypted) == a_string
        end
      end
    end

    ENCRYPTOR = BcryptEncriptor
  end
end
