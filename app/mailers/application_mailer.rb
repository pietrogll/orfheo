# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: 'orfheo community <notification@orfheo.org>'
  layout 'mailer'

  private

  def prepare_body_with(body_text, footer)
    "<div style=\"color:#000000\"> #{body_text} </div> #{footer}"
  end

  def get_footer(footer_type = :generic, lang = :en)
    translator = Services::Translator.new(lang)
    footer_text = translator.translate("foot_note_#{footer_type}")
    "<div style=\"margin-top:60px\"> <p style=\"color: #6f6f6f; font-size: 10px; \"> #{footer_text} </p></div>"
  end
end
