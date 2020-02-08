import  React from 'react'

class JQueryElement extends React.Component {

  constructor (props, jqueryEl) {
    super(props)
    this.jqueryEl = jqueryEl
  }

  renderJQueryElement(){
    $(this.refs.mountingJQueryPoint).html(
      this.jqueryEl.render()
    )
  }
  
  componentDidMount(){
    this.renderJQueryElement()
    $(this.refs.mountingJQueryPoint).foundation()
  }

  rerenderJQueryElement(prevProps, jqueryEl){
    if(Object.keys(prevProps.owner).some(key => prevProps.owner[key] != this.props.owner[key])
    ){
      this.jqueryEl = jqueryEl
      this.renderJQueryElement();
    }
  }
  
  render(){
    return <span ref='mountingJQueryPoint' className={this.props.className}></span>
  }
    
}

export default JQueryElement