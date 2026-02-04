class ContactMailer < ApplicationMailer
  # Feedback email
  def feedback_email(recipient_email, feedback_data)
    @feedback = feedback_data
    @lang = (feedback_data[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(feedback_data || {})
    translator = Services::Translator.new(@lang)

    # Use fallback if translation fails
    begin
      @subject = translator.translate('email.feedback.subject')
      @body_text = translator.translate('email.feedback.body')
    rescue NoMethodError
      @subject = 'Feedback from orfheo.org'
      @body_text = feedback_data[:message] || 'New feedback received'
    end

    mail(
      to: recipient_email,
      from: feedback_data[:email],
      subject: @subject,
      body: @body_text,
      content_type: 'text/html'
    )
  end

  # Tech support email
  def tech_support_email(recipient_email, support_data)
    @support = support_data
    @lang = (support_data[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(support_data || {})
    translator = Services::Translator.new(@lang)

    # Use fallback if translation fails
    begin
      @subject = translator.translate('email.techSupport.subject')
      @body_text = translator.translate('email.techSupport.body')
    rescue NoMethodError
      @subject = 'Tech Support Request from orfheo.org'
      @body_text = support_data[:issue] || 'New tech support request'
    end

    mail(
      to: recipient_email,
      from: support_data[:email],
      subject: @subject,
      body: @body_text,
      content_type: 'text/html'
    )
  end

  # Business inquiry email
  def business_email(recipient_email, business_data)
    @business = business_data
    @lang = (business_data[:lang] || Dictionary.default_language).to_sym

    Dictionary.load(business_data || {})
    translator = Services::Translator.new(@lang)

    # Use fallback if translation fails
    begin
      @subject = translator.translate('email.business.subject')
      @body_text = translator.translate('email.business.body')
    rescue NoMethodError
      @subject = 'Business Inquiry from orfheo.org'
      @body_text = business_data[:inquiry] || 'New business inquiry'
    end

    mail(
      to: recipient_email,
      from: business_data[:email],
      subject: @subject,
      body: @body_text,
      content_type: 'text/html'
    )
  end
end
