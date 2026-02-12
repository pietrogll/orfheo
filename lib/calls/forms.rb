# frozen_string_literal: true

class FormsManager
  def initialize(user_id, params)
    @form = new_form user_id, params
    @params = params
  end

  def create
    check_fields!
    Repos::Forms.save form.to_h
    form.to_h
  end

  def modify
    check_fields!
    Repos::Forms.modify form.to_h
    form.to_h
  end

  def delete
    raise Pard::Invalid::EmptyProposals if has_proposals?(params[:id])

    Repos::Forms.delete params[:id]
  end

  def check_fields!
    raise Pard::Invalid::Params if mandatory.any? do |field|
      params[field].blank?
    end

    blocks_checker params[:type], params[:blocks]
    texts_checker params[:texts]
  end

  def form_proposals(form_id)
    Repos::Artistproposals.get({ form_id: form_id }) + Repos::Spaceproposals.get({ form_id: form_id })
  end

  private

  attr_reader :params, :form

  def new_form(user_id, params)
    keys = %i[
      id
      call_id
      user_id
      type
      texts
      own
      widgets
      blocks
    ]
    form = Hash[keys.map { |sym|
      # This line is to allow modifying each field indipendently form the others
      [sym, params[sym]] if params.key?(sym.to_s) || params.key?(sym)
    }.compact]
    form[:id] ||= SecureRandom.uuid
    form[:user_id] ||= user_id
    form
  end

  def mandatory
    %i[
      type
      blocks
      texts
    ]
  end

  def mandatory_artist_fields
    [
      :title,
      :description,
      :short_description,
      :category,
      :subcategory,
      :format
      # :children
    ]
  end

  def mandatory_texts_fields
    [
      :label
    ]
  end

  def mandatory_space_fields
    [
      :subcategory
    ]
  end

  def mandatory_blocks_fields
    {
      'artist' => mandatory_artist_fields,
      'space' => mandatory_space_fields
    }
  end

  def blocks_checker(type, blocks)
    blocks_keys = blocks.values.map do |lang_form|
      keys = lang_form.keys
      # keys.each{ |k|
      #   lang_form[k][:args] = lang_form[k]['args'].values unless lang_form[k]['args'].nil? || lang_form[k]['args'].is_a?(Array)
      # }
      keys
    end.uniq
    raise Pard::Invalid::Blocks unless blocks_keys.size <= 1
    raise Pard::Invalid::Blocks if mandatory_blocks_fields[type.to_s].any? do |field|
      !blocks_keys.first.map(&:to_sym).include?(field)
    end
  end

  def texts_checker(texts)
    texts_keys = texts.values.map(&:keys).uniq
    raise Pard::Invalid::FormsTexts unless texts_keys.size <= 1
    raise Pard::Invalid::FormsTexts if mandatory_texts_fields.any? do |field|
      !texts_keys.first.map(&:to_sym).include?(field) || texts.values.first[field].blank?
    end
  end

  def has_proposals?(form_id)
    proposals = form_proposals form_id
    proposals.size.positive?
  end
end
