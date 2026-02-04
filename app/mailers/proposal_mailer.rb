class ProposalMailer < ApplicationMailer
  # Artist proposal notification
  def artist_proposal_email(user, proposal_data)
    @user = user
    @proposal = proposal_data
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(proposal_data))
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.artist_proposal.subject')
    @body_text = translator.translate('email.artist_proposal.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Space proposal notification
  def space_proposal_email(user, proposal_data)
    @user = user
    @proposal = proposal_data
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(proposal_data))
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.space_proposal.subject')
    @body_text = translator.translate('email.space_proposal.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Rejection notification
  def rejection_email(user, rejection_data)
    @user = user
    @rejection = rejection_data
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(rejection_data))
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.rejected.subject')
    @body_text = translator.translate('email.rejected.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Call deleted notification
  def deleted_call_email(user, call_data)
    @user = user
    @call = call_data
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(call_data))
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.deleted_call.subject')
    @body_text = translator.translate('email.deleted_call.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end
end
