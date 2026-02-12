# frozen_string_literal: true

module Util
  class << self
    def number_string_value_to_int(hash)
      hash.map do |k, v|
        if v.is_a?(String)
          num = v.to_i
          num = v unless num.to_s == v
          [k, num]
        else
          [k, v]
        end
      end.to_h
    end

    def string_keyed_hash_to_symbolized(hash)
      # Return non-hash values as-is
      return hash unless hash.is_a?(Hash)

      hash.each_with_object({}) do |(k, v), result|
        new_k = k.is_a?(String) ? k.to_sym : k
        new_v = if v.is_a? Hash
                  string_keyed_hash_to_symbolized(v)
                elsif v.is_a? Array
                  symbolize_array(v)
                else
                  v
                end
        result[new_k] = new_v
      end
    end

    def symbolize_array(array)
      array.map do |v|
        next string_keyed_hash_to_symbolized v if v.is_a? Hash
        next symbolize_array v if v.is_a? Array

        v
      end
    end

    def stringify_hash(hash)
      hash.map do |k, v|
        next [k.to_s, stringify_hash(v)] if v.is_a? Hash
        next [k.to_s, stringify_array(v)] if v.is_a? Array
        next [k.to_s, v.to_s] if v.is_a? Symbol

        [k.to_s, v]
      end.to_h
    end

    def stringify_array(array)
      array.map do |v|
        next stringify_hash v if v.is_a? Hash
        next stringify_array v if v.is_a? Array

        v
      end
    end

    def arrayify_hash(hash)
      return hash if hash.is_a? Array
      return [] if hash.blank?
      return symbolize_array(hash) if hash.is_a? Array
      return hash unless hash.is_a? Hash

      hash.map do |_k, v|
        string_keyed_hash_to_symbolized(v)
      end
    end

    def translate(array)
      array.map do |value|
        esp_eng(I18n.transliterate(value.downcase))
      end
    end
  end
end
