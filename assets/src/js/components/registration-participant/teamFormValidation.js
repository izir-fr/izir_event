var formToComplete = require('./formToComplete')

var teamFormValidation = (form) => {
  var formErreur = 0

  form.data.team = {
    name: null,
    capitaine: {
      nom: null,
      prenom: null,
      email: null,
      codePostal: null,
      city: null
    },
    membres: [{
      nom: null,
      prenom: null,
      email: null,
      jourNaissance: null,
      moisNaissance: null,
      anneeNaissance: null,
      team: null,
      sex: null,
      numLicence: null,
      event: null,
      certificat: null
    }]
  }

  // form validation init
  form.option.formValidation = false

  if ($('input[name=capitaine_team]').val() === '') {
    formErreur += 1
    formToComplete($('input[name=capitaine_team]'))
  } else if ($('input[name=capitaine_name]').val() === '') {
    formErreur += 1
    formToComplete($('input[name=capitaine_name]'))
  } else if ($('input[name=capitaine_surname]').val() === '') {
    formErreur += 1
    formToComplete($('input[name=capitaine_surname]'))
  } else if ($('input[name=capitaine_cp]').val() === '') {
    formErreur += 1
    formToComplete($('input[name=capitaine_cp]'))
  } else if ($('input[name=capitaine_city]').val() === '') {
    formErreur += 1
    formToComplete($('input[name=capitaine_city]'))
  } else if ($('input[name=capitaine_email]').val() === '' || form.option.emailRegex.test($('input[name=capitaine_email]').val()) === false) {
    formErreur += 1
    formToComplete($('input[name=capitaine_email]'))
  } else {
    // member form validation
    $('.team-count').each((key, val) => {
      if (key <= Number(form.option.team.min)) {
        if ($('input[name=member_nom]')[key].value === '') {
          formErreur += 1
          formToComplete($($('input[name=member_nom]')[key]))
        } else if ($('input[name=member_prenom]')[key].value === '') {
          formErreur += 1
          formToComplete($($('input[name=member_prenom]')[key]))
        } else if ($('input[name=member_sex]')[key].value === '') {
          formErreur += 1
          formToComplete($($('input[name=member_sex]')[key]))
        } else if ($('.membre_birth_day')[key].value === '') {
          formErreur += 1
          formToComplete($($('.membre_birth_day')[key]))
        } else if ($('.membre_birth_month')[key].value === '') {
          formErreur += 1
          formToComplete($($('.membre_birth_month')[key]))
        } else if ($('input[name=membre_birth_year]')[key].value === '' || Number($('input[name=membre_birth_year]')[key].value) < 1900) {
          formErreur += 1
          formToComplete($($('input[name=membre_birth_year]')[key]))
        } else if ($('input[name=member_email]')[key].value === '') {
          formErreur += 1
          formToComplete($($('input[name=member_email]')[key]))
        }
      }
    })
  }

  // vérification du nombre d'inscrit
  if ($('.team-count').length >= Number(form.option.team.min) && formErreur < 1) {
    form.option.formValidation = true
    form.data.team = {
      name: $('input[name=capitaine_team]').val(),
      capitaine: {
        nom: $('input[name=capitaine_name]').val(),
        prenom: $('input[name=capitaine_surname]').val(),
        email: $('input[name=capitaine_email]').val(),
        codePostal: $('input[name=capitaine_cp]').val(),
        city: $('input[name=capitaine_city]').val()
      },
      membres: []
    }

    $('.team-count').each((key, val) => {
      form.data.team.membres.push(
        {
          nom: $('input[name=member_nom]')[key].value,
          prenom: $('input[name=member_prenom]')[key].value,
          email: $('input[name=member_email]')[key].value,
          jourNaissance: $('.membre_birth_day')[key].value,
          moisNaissance: $('.membre_birth_month')[key].value,
          anneeNaissance: $('input[name=membre_birth_year]')[key].value,
          team: $('input[name=capitaine_team]').val(),
          sex: $('input[name=member_sex]')[key].value,
          numLicence: $('input[name=member_license]')[key].value,
          event: $('input[name=eventName]').val(),
          certificat: $('input[name=certificat_membre_file]')[key].value
        }
      )
    })
  }
  return form
}

module.exports = teamFormValidation
