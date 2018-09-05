// form defaults options definition
var form = require('./registration-participant/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#cart-form').length !== 0) {
    // HTML constructors
    // var teamMemberForm = $('#team-member')[0].outerHTML
    // var teamForm = $('#step-team')[0].innerHTML
    // var individuelForm = $('#step-participant')[0].innerHTML
    // var newParticipantCheckedAction = require('./registration-participant/newParticipantCheckedAction')

    // var epreuveValidationWarning = $('#epreuve-validation-warning')

    // get cart
    // var getSelectedEpreuve = require('./registration-participant/getSelectedEpreuve')

    // single
    // get single form and next functions
    // var participantFormValidation = require('./registration-participant/participantFormValidation')
    // var participantCertificatValidation = require('./registration-participant/participantCertificatValidation')
    // var participantFormDone = require('./registration-participant/participantFormDone')

    // team
    // get team form and next functions
    // var addTeamMemberBtn = require('./registration-participant/addTeamMemberBtn')
    // var teamVerification = require('./registration-participant/teamVerification')
    // var teamFormValidation = require('./registration-participant/teamFormValidation')
    // var teamCertificatValidation = require('./registration-participant/teamCertificatValidation')
    // var teamFormDone = require('./registration-participant/teamFormDone')

    // get confirmation épreuves
    // var displayConfirmationEpreuve = require('./registration-participant/displayConfirmationEpreuve')

    // var ajaxPostForm = require('./registration-participant/ajaxPostForm')

    // init team & indiv form
    // $('#step-team')[0].innerHTML = ''
    // $('#step-participant')[0].innerHTML = ''

    $(() => {
      // Date limite verification
      var dateLimite = new Date($('input[name=dateLimite]').val())

      if (form.option.dateNow > dateLimite) {
        $('#registration-form').remove()
        $('#divForm').append('<div class="col-sm-12"><p class="alert alert-danger">La date limite d\'inscription à cette épreuve dépassée</p></div>')
      }

      // ----
      // Step 2 new participant
      // ----

      // $(document).on('click', '#userRegisterButton', () => {
      //   $('#inscriptionForm').removeClass('hidde')
      //   $('#inscriptionSelect').remove()
      //   form = participantFormValidation(form)
      //   form = participantCertificatValidation(form)
      //   participantFormDone(form)
      // })

      // $(document).on('click', '#otherRegisterButton', () => {
      //   $('#inscriptionForm').removeClass('hidde')
      //   $('#newParticipant').prop('checked', true)
      //   newParticipantCheckedAction()
      //   $('#inscriptionSelect').remove()
      //   form = participantFormValidation(form)
      //   form = participantCertificatValidation(form)
      //   participantFormDone(form)
      // })

      // $(document).on('click', 'input[name=newParticipant]', () => {
      //   newParticipantCheckedAction()
      // })

      // ----
      // Step 2 to 3 from participant
      // ----

      // $(document).on('change', '.input-participant-validation', (e) => {
      //   form = participantFormValidation(form)
      //   form = participantCertificatValidation(form)
      //   participantFormDone(form)
      // })

      // $(document).on('click', '#participant-form-submit', () => {
      //   displayConfirmationEpreuve(form)
      //   // Confirmation data
      //   $('#confirmation-nom').text(form.data.participant.nom)
      //   $('#confirmation-prenom').text(form.data.participant.prenom)
      //   $('#confirmation-email').text(form.data.participant.email)
      //   $('#confirmation-date').text(form.data.participant.jourNaissance + '/' + form.data.participant.moisNaissance + '/' + form.data.participant.anneeNaissance)
      //   $('#confirmation-team').text(form.data.participant.team)
      //   $('#confirmation-sex').text(form.data.participant.sex)
      //   $('#confirmation-licence').text(form.data.participant.numLicence)
      //   $('#confirmation-categorie').text(form.data.participant.categorie)
      //   $('#confirmation-adresse1').text(form.data.participant.adresse1)
      //   $('#confirmation-adresse2').text(form.data.participant.adresse2)
      //   $('#confirmation-codePostal').text(form.data.participant.codePostal)
      //   $('#confirmation-city').text(form.data.participant.city)

      //   // Action
      //   $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
      //   $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
      //   $('#step-participant').addClass('hidde')
      //   $('#step-confirmation').removeClass('hidde')
      // })

      // ----
      // Step 2 TEAMMATE add
      // ----

      // $(document).on('click', '#add-team_member', (e) => {
      //   $('#new-team-block').append(teamMemberForm)
      //   addTeamMemberBtn(form.option.team.max)
      // })

      // $(document).on('change', '.input-team-validation', (e) => {
      //   form = teamFormValidation(form)
      //   form = teamCertificatValidation(form)
      //   teamFormDone(form)
      // })

      // ----
      // Step 2 to 3 from team
      // ----
      // $(document).on('click', '#team-form-submit', () => {
      //   displayConfirmationEpreuve(form)
      //   // remove particpant confirmation data fields
      //   $($('#confirmation-date').parent().get(0)).remove()
      //   $($('#confirmation-sex').parent().get(0)).remove()
      //   $($('#confirmation-licence').parent().get(0)).remove()
      //   $($('#confirmation-categorie').parent().get(0)).remove()
      //   $($('#confirmation-adresse1').parent().get(0)).remove()
      //   $($('#confirmation-adresse2').parent().get(0)).remove()

      //   // Confirmation data
      //   $('#confirmation-nom').text(form.data.team.capitaine.nom)
      //   $('#confirmation-prenom').text(form.data.team.capitaine.prenom)
      //   $('#confirmation-email').text(form.data.team.capitaine.email)
      //   $('#confirmation-team').text(form.data.team.name)
      //   $('#confirmation-codePostal').text(form.data.team.capitaine.codePostal)
      //   $('#confirmation-city').text(form.data.team.capitaine.city)
      //   $('#header-recap-people').text('Team Manager')

      //   // Action
      //   $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
      //   $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
      //   $('#step-team').addClass('hidde')
      //   $('#step-confirmation').removeClass('hidde')

      //   $('#participant-form-back').addClass('hidde')
      //   $('#team-form-back').removeClass('hidde')
      // })

      // ----
      // Step 3 to POST
      // ----
      $(document).on('submit', '#UNDEFINED', (e) => {
        // ajaxPostForm(form)
        e.preventDefault()
      })
    })
  }
}

export default registrationValidation()
