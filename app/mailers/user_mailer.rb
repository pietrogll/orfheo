class UserMailer < ApplicationMailer
  # Welcome email when user registers
  def welcome_email(user)
    @user = user
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user)
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.welcome.subject')
    @body_text = translator.translate('email.welcome.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Event notification email
  def event_email(user, event_info)
    @user = user
    @event_info = event_info
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(event_info))
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.event.subject')
    @body_text = translator.translate('email.event.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Forgotten password email
  def forgotten_password_email(user)
    @user = user
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user)
    translator = Services::Translator.new(@lang)

    @subject = translator.translate('email.forgotten_password.subject')
    @body_text = translator.translate('email.forgotten_password.body')
    @footer = get_footer(:standard, @lang)

    mail(
      to: user[:email],
      subject: @subject,
      body: prepare_body_with(@body_text, @footer),
      content_type: 'text/html'
    )
  end

  # Generic email with custom content
  def generic_email(user, payload)
    @user = user
    @payload = payload
    @lang = (user[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(user.merge(payload))

    email_type = payload[:email_type]
    footer = get_footer(email_type, @lang)
    default_lang = Dictionary.default_language
    payload_translated = payload[@lang] || payload[default_lang]

    mail(
      to: user[:email],
      subject: payload_translated[:subject],
      body: prepare_body_with(payload_translated[:body], footer),
      content_type: 'text/html'
    )
  end
end
