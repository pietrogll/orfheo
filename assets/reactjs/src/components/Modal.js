import React from 'react'

const Modal = props => {
  let innerClass = "vcenter-inner"
  if (props.stickToTop) innerClass += " stick-to-top"
  return (
    <div className="vcenter-outer">
      <div className={innerClass} onClick={props.onModalClose} />
      <div className="popup-container-full-large">
        <div className="content-popup-header">
        </div>
        <section className="popup-content">
          {props.children}
        </section>
      </div>
  <button className="modal-close is-large" data-testid="button-close" onClick={props.onModalClose} />
    </div>
  )
}

Modal.defaultProps = {
  onModalClose: () => {}
}
export default Modal
