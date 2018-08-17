// form defaults options definition
var form = require('./registration-participant/form')

// registration form with some validation
var registrationValidation = () => {
  if ($('#registration-form').length !== 0) {
    // HTML constructors
    var epreuveValidationWarning = $('#epreuve-validation-warning')
    var teamMemberForm = $('#team-member')[0].outerHTML
    var teamForm = $('#step-team')[0].innerHTML
    var individuelForm = $('#step-participant')[0].innerHTML
    var newParticipantCheckedAction = require('./registration-participant/newParticipantCheckedAction')

    // get cart
    var getSelectedEpreuve = require('./registration-participant/getSelectedEpreuve')

    // single
    // get single form and next functions
    var participantFormValidation = require('./registration-participant/participantFormValidation')
    var participantCertificatValidation = require('./registration-participant/participantCertificatValidation')
    var participantFormDone = require('./registration-participant/participantFormDone')

    // team
    // get team form and next functions
    var addTeamMemberBtn = require('./registration-participant/addTeamMemberBtn')
    var teamVerification = require('./registration-participant/teamVerification')
    var teamFormValidation = require('./registration-participant/teamFormValidation')
    var teamCertificatValidation = require('./registration-participant/teamCertificatValidation')
    var teamFormDone = require('./registration-participant/teamFormDone')

    // get confirmation épreuves
    var displayConfirmationEpreuve = require('./registration-participant/displayConfirmationEpreuve')

    // init team & indiv form
    $('#step-team')[0].innerHTML = ''
    $('#step-participant')[0].innerHTML = ''

    $(() => {
      // Date limite verification
      var dateLimite = new Date($('input[name=dateLimite]').val())

      if (form.option.dateNow > dateLimite) {
        $('#registration-form').remove()
        $('#divForm').append('<div class="col-sm-12"><p class="alert alert-danger">La date limite d\'inscription à cette épreuve dépassée</p></div>')
      }

      // ----
      // Step 1 to 2
      // ----

      // complete form.data.epreuve{}
      $('.input').on('change', (e) => {
        form = getSelectedEpreuve(form)
        // UX helper and alert
        if (form.data.cart.epreuve.length < 1 || form.data.cart.epreuve[0].qty === null) {
          $('#epreuve-form-submit').addClass('disabled')
        } else if (form.data.cart.epreuve.length > 1) {
          $('#epreuve-form-submit').addClass('disabled')
          window.alert("Vous ne pouvez vous inscrire qu'à une épreuve à la fois")
          epreuveValidationWarning.removeClass('hidde')
        } else {
          $('#epreuve-form-submit').removeClass('disabled')
        }
      })

      $('#epreuve-form-submit').on('click', (e) => {
        // check if team
        form = teamVerification(form)
        $('#step-team')[0].innerHTML = ''
        $('#step-participant')[0].innerHTML = ''
        $('#header-epreuve').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#header-participant').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#step-epreuve').addClass('hidde')

        if (form.option.epreuve_format.team) {
          $('#step-team').append(teamForm)
          $('#currentTeamLength').text($('.team-count').length)
          $('#maxTeamLength').text(form.option.team.max)
          $('#option-team-min').text(form.option.team.min)
          $('input[name=teamActivate').val('true')
          $('#step-team').removeClass('hidde')
        } else {
          $('#step-participant').append(individuelForm)
          $('#step-participant').removeClass('hidde')
        }
      })

      // ----
      // Step 2 new participant
      // ----

      $(document).on('click', '#userRegisterButton', () => {
        $('#inscriptionForm').removeClass('hidde')
        $('#inscriptionSelect').remove()
        form = participantFormValidation(form)
        form = participantCertificatValidation(form)
        participantFormDone(form)
      })

      $(document).on('click', '#otherRegisterButton', () => {
        $('#inscriptionForm').removeClass('hidde')
        $('#newParticipant').prop('checked', true)
        newParticipantCheckedAction()
        $('#inscriptionSelect').remove()
        form = participantFormValidation(form)
        form = participantCertificatValidation(form)
        participantFormDone(form)
      })

      $(document).on('click', 'input[name=newParticipant]', () => {
        newParticipantCheckedAction()
      })

      // ----
      // Step 2 to 3 from participant
      // ----

      $(document).on('change', '.input-participant-validation', (e) => {
        form = participantFormValidation(form)
        form = participantCertificatValidation(form)
        participantFormDone(form)
      })

      $(document).on('click', '#participant-form-submit', () => {
        displayConfirmationEpreuve(form)
        // Confirmation data
        $('#confirmation-nom').text(form.data.participant.nom)
        $('#confirmation-prenom').text(form.data.participant.prenom)
        $('#confirmation-email').text(form.data.participant.email)
        $('#confirmation-date').text(form.data.participant.jourNaissance + '/' + form.data.participant.moisNaissance + '/' + form.data.participant.anneeNaissance)
        $('#confirmation-team').text(form.data.participant.team)
        $('#confirmation-sex').text(form.data.participant.sex)
        $('#confirmation-licence').text(form.data.participant.numLicence)
        $('#confirmation-categorie').text(form.data.participant.categorie)
        $('#confirmation-adresse1').text(form.data.participant.adresse1)
        $('#confirmation-adresse2').text(form.data.participant.adresse2)
        $('#confirmation-codePostal').text(form.data.participant.codePostal)
        $('#confirmation-city').text(form.data.participant.city)

        // Action
        $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#step-participant').addClass('hidde')
        $('#step-confirmation').removeClass('hidde')
      })

      // ----
      // Step 2 TEAMMATE add
      // ----

      $(document).on('click', '#add-team_member', (e) => {
        $('#new-team-block').append(teamMemberForm)
        addTeamMemberBtn(form.option.team.max)
      })

      $(document).on('change', '.input-team-validation', (e) => {
        form = teamFormValidation(form)
        form = teamCertificatValidation(form)
        teamFormDone(form)
      })

      // ----
      // Step 2 to 3 from team
      // ----
      $(document).on('click', '#team-form-submit', () => {
        displayConfirmationEpreuve(form)
        // remove particpant confirmation data fields
        $($('#confirmation-date').parent().get(0)).remove()
        $($('#confirmation-sex').parent().get(0)).remove()
        $($('#confirmation-licence').parent().get(0)).remove()
        $($('#confirmation-categorie').parent().get(0)).remove()
        $($('#confirmation-adresse1').parent().get(0)).remove()
        $($('#confirmation-adresse2').parent().get(0)).remove()

        // Confirmation data
        $('#confirmation-nom').text(form.data.team.capitaine.nom)
        $('#confirmation-prenom').text(form.data.team.capitaine.prenom)
        $('#confirmation-email').text(form.data.team.capitaine.email)
        $('#confirmation-team').text(form.data.team.name)
        $('#confirmation-codePostal').text(form.data.team.capitaine.codePostal)
        $('#confirmation-city').text(form.data.team.capitaine.city)
        $('#header-recap-people').text('Team Manager')

        // Action
        $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#step-team').addClass('hidde')
        $('#step-confirmation').removeClass('hidde')

        $('#participant-form-back').addClass('hidde')
        $('#team-form-back').removeClass('hidde')
      })
    })
  }
}

export default registrationValidation()
