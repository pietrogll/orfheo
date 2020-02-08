import JQueryElement from './JQueryElement'

class Footer extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.Footer())
  }
}

class LoginHeader extends JQueryElement {
  constructor (props) {
    const header = Pard.Widgets.LoginHeader()
    super(props, header)
  }
}

class InsideHeader extends JQueryElement {
  constructor (props) { 
    const header = Pard.Widgets.InsideHeader()
    super(props, header)
  }
}

class ProfileCard extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.CreateCard(props.profile))
  }
}

class EventCard extends JQueryElement {
  constructor (props) { 
    super(props, {render: () => Pard.Widgets.EventCard(props.event, Pard.UserStatus['status'] === 'owner')})
  }
}

class ProductionCard extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.ProposalCard(props.production))
  }
}

class ProductionPopupContent extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.ProposalPopupContent)
  }

  renderJQueryElement(){
    $(this.refs.mountingJQueryPoint).html(
      this.jqueryEl(this.props.production.id, this.props.production)
    )
    Pard.Backend.getPublicInfo(
      this.props.production.id,
      'productions',
      (data) => {
        if (data.status == 'success') {
          const production = data.db_element
          $(this.refs.mountingJQueryPoint).html(
            this.jqueryEl(production.id, production)
          )
        }
      }
    )
  }
}

class SpaceCard extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.SpaceCard(props.space))
  }
}

class SpacePopupContent extends JQueryElement {
  constructor (props) { 
    super(props, Pard.Widgets.SpacePopupContent)
  }

  renderJQueryElement(){
    $(this.refs.mountingJQueryPoint).html(
      this.jqueryEl(this.props.space.id, this.props.space)
    )
    Pard.Backend.getPublicInfo(
      this.props.space.id,
      'spaces',
      (data) => {
        if (data.status == 'success') {
          const space = data.db_element
          $(this.refs.mountingJQueryPoint).html(
            this.jqueryEl(space.id, space)
          )
        }
      }
    )
  }
}

class Icon extends JQueryElement {
  constructor (props) {
    super(props, Pard.Widgets.IconManager(props.iconKey))
  }
}

class Loader extends JQueryElement {
  constructor(props){
    super(props, Pard.Widgets.Loader())
  }
}

class Owner extends JQueryElement {
  constructor(props){
    super(props, {render: () => Pard.Widgets.OwnerBlock(props.owner)})
  }

  componentDidUpdate(prevProps){
    this.rerenderJQueryElement(prevProps, {render: () => Pard.Widgets.OwnerBlock(this.props.owner)})
  }
  
}



export { Footer, InsideHeader, LoginHeader, ProfileCard, ProductionCard, ProductionPopupContent, Icon, EventCard, SpaceCard, SpacePopupContent, Loader, Owner }