var teamMin, teamMax
var formValidation = false
var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i

var dateNow = new Date(Date.now())

var formToComplete = (field) => {
  $('.border-danger').each((key, val) => {
    $(val).removeClass('border-danger')
  })
  field.addClass('border border-danger').focus()
}

var addTeamMemberBtn = (maxVal) => {
  if ($('.team-count').length >= maxVal) {
    $('#add-team_member').remove()
  } else {
    $('#currentTeamLength').text($('.team-count').length)
  }
}

var teamVerification = () => {
  var team = 0
  $('.subtotalInput').each((key, val) => {
    if ($(val).hasClass('teamActivate') === true && Number($(val).val()) > 0) {
      teamMin = $($(val).parent().get(0)).find('input[name=team_min]').val()
      teamMax = $($(val).parent().get(0)).find('input[name=team_max]').val()

      $('#maxTeamLength').text(teamMax)
      addTeamMemberBtn(teamMax)
      team += 1
    }
  })
  if (team > 0) {
    return true
  } else {
    return false
  }
}

// confirmation épreuves
var displayConfirmationEpreuve = () => {
  if ($('.confirmationProduit').length >= 1) {
    $('.confirmationProduit').each((key, val) => {
      $(val).remove()
    })
  }

  $('.subtotalView').each((key, val) => {
    if (parseInt($($('.subtotalView')[key]).text()) > 0) {
      var produit = $($($($($('.subtotalView')[key]).parent()).parent()).children()[0]).text()
      var qty = $($($($($($('.subtotalView')[key]).parent()).parent()).children()[1]).children()[0]).val()
      var price = $($($($($('.subtotalView')[key]).parent()).parent()).children()[2]).text()
      var subTotal = $($($($($('.subtotalView')[key]).parent()).parent()).children()[3]).text()

      $('#confirmation-epreuve').append(
        '<div class="row confirmationProduit">' +
          '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + produit + '</div>' +
          '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + qty + '</div>' +
          '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + price + '</div>' +
          '<div class="col-3 spacer-sm-top spacer-sm-bottom">' + subTotal + '</div>' +
        '</div>'
      )
      $('#confirmation-total').text($('#total-ttc').text())
    }
  })
}

var registrationValidation = () => {
  if ($('#registration-form').length !== 0) {
    var teamMemberForm = $('#team-member')[0].outerHTML
    $(() => {
      // FORM VALIDATION START
      var newParticipant = $('input[name=newParticipant]')
      var nom = $('input[name=surname]')
      var prenom = $('input[name=name]')
      var email = $('input[name=email]')
      var jourNaissance = $('#jourNaissance')
      var moisNaissance = $('#moisNaissance')
      var anneeNaissance = $('input[name=anneeNaissance]')
      var team = $('input[name=team]')
      var sex = $('#sex')
      var numLicence = $('input[name=numLicence]')
      var categorie = $('#categorie')
      var event = $('input[name=id]')
      var adresse1 = $('input[name=adresse1]')
      var adresse2 = $('input[name=adresse2]')
      var codePostal = $('input[name=codePostal]')
      var city = $('input[name=city]')
      var certificat = $('input[name=certificat_file]')

      var user = {
        nom: nom.val(),
        prenom: prenom.val(),
        email: email.val(),
        jourNaissance: jourNaissance.val(),
        moisNaissance: moisNaissance.val(),
        anneeNaissance: anneeNaissance.val(),
        team: team.val(),
        sex: sex.val(),
        numLicence: numLicence.val(),
        categorie: categorie.val(),
        event: event.val(),
        adresse1: adresse1.val(),
        adresse2: adresse2.val(),
        codePostal: codePostal.val(),
        city: city.val(),
        certificat: certificat.val()
      }

      // Step 1 to 2
      $('#epreuve-form-submit').on('click', (e) => {
        // limitation à 1 epreuve /inscription
        var validation = 0
        // team validation
        var team = teamVerification()

        $('.epreuve-validation .quantityInput').each((key, val) => {
          if (parseInt($(val).val()) !== 0) {
            validation++
          }
        })
        if (validation === 0) {
          window.alert('Vous devez vous inscrire à une épreuve')
          e.preventDefault()
        } else if (validation > 1) {
          window.alert("Vous ne pouvez vous inscrire qu'à une épreuve à la fois")
          e.preventDefault()
        } else {
          $('#header-epreuve').removeClass('txt-dark-blue').addClass('text-secondary')
          $('#step-epreuve').addClass('hidde')
          if (team) {
            $('#currentTeamLength').text($('.team-count').length)
            $('input[name=teamActivate').val('true')
            $('#header-participant').removeClass('text-secondary').addClass('txt-dark-blue')
            $('#step-team').removeClass('hidde')
          } else {
            $('#header-participant').removeClass('text-secondary').addClass('txt-dark-blue')
            $('#step-participant').removeClass('hidde')
          }
        }
      })

      // Step 2 participant to 1
      $('#epreuve-form-back').on('click', (e) => {
        $('#step-epreuve').removeClass('hidde')
        $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#step-participant').addClass('hidde')
      })

      // Step 2 team to 1
      $('#epreuve-form-back-team').on('click', (e) => {
        $('input[name=teamActivate').val('false')
        $('#step-epreuve').removeClass('hidde')
        $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#step-team').addClass('hidde')
      })

      // Step 2 new participant
      var newParticipantCheckedAction = () => {
        if (newParticipant.is(':checked')) {
          nom.val('')
          prenom.val('')
          email.val('')
          jourNaissance.val('')
          moisNaissance.val('')
          anneeNaissance.val('')
          team.val('')
          sex.val('')
          numLicence.val('')
          categorie.val('')
          event.val('')
          adresse1.val('')
          adresse2.val('')
          codePostal.val('')
          city.val('')

          // certificat
          $('#user_certificat').addClass('hidde')
          $('#other_participant_certificat').removeClass('hidde')
          certificat.val('')
        } else {
          nom.val(user.nom)
          prenom.val(user.prenom)
          email.val(user.email)
          jourNaissance.val(user.jourNaissance)
          moisNaissance.val(user.moisNaissance)
          anneeNaissance.val(user.anneeNaissance)
          team.val(user.team)
          sex.val(user.sex)
          categorie.val(user.categorie)
          adresse1.val(user.adresse1)
          adresse2.val(user.adresse2)
          codePostal.val(user.codePostal)
          city.val(user.city)

          // certificat
          $('#user_certificat').removeClass('hidde')
          $('#other_participant_certificat').addClass('hidde')
          certificat.val(user.certificat)
        }
      }

      $('#userRegisterButton').on('click', () => {
        $('#inscriptionForm').removeClass('hidde')
        $('#inscriptionSelect').remove()
      })

      $('#otherRegisterButton').on('click', () => {
        $('#inscriptionForm').removeClass('hidde')
        $('#newParticipant').prop('checked', true)
        newParticipantCheckedAction()
        $('#inscriptionSelect').remove()
      })

      newParticipant.on('click', () => {
        newParticipantCheckedAction()
      })

      // Step 2 TEAMMATE add
      $('#add-team_member').on('click', (e) => {
        $('#new-team-block').append(teamMemberForm)
        addTeamMemberBtn(teamMax)
      })

      // Step 2 to 3 from participant
      $('#participant-form-submit').on('click', (e) => {
        // default var
        var certificatValidation = false

        // borders init
        $('input').removeClass('border border-danger')
        $($('#confirmation-epreuve').children()).remove()

        // FORM VALIDATION
        if (nom.val() === '') {
          formToComplete(nom)
        } else if (prenom.val() === '') {
          formToComplete(prenom)
        } else if (email.val() === '' || email.val() === null || emailRegex.test(email.val()) === false) {
          formToComplete(email)
        } else if (sex.val() === null || sex.val() === '') {
          formToComplete(sex)
        } else if (jourNaissance.val() === null || jourNaissance.val() === '') {
          formToComplete(jourNaissance)
        } else if (moisNaissance.val() === null || moisNaissance.val() === '') {
          formToComplete(moisNaissance)
        } else if (anneeNaissance.val() === '') {
          formToComplete(anneeNaissance)
        } else if (categorie.val() === null || categorie.val() === '') {
          formToComplete(categorie)
        } else if (adresse1.val() === '') {
          formToComplete(adresse1)
        } else if (codePostal.val() === '') {
          formToComplete(codePostal)
        } else if (city.val() === '') {
          formToComplete(city)
        } else {
          formValidation = true
        }

        if (formValidation === true) {
          // CERTIFICAT VALIDATION
          if ($('input[name=certificat_required]').val() === 'false') {
            certificatValidation = true
          } else if ($('input[name=certificat_file]').val() === '') {
            certificatValidation = false
            window.alert('Merci d\'ajouter un certificat medical valide pour continuer votre inscription')// console.log(certificatValidation)
          } else if ($('input[name=certificatCondition]').is(':checked') === false) {
            certificatValidation = false
            window.alert("Merci de cocher la case de déclaration d'authenticité et de validité  du certificat médical")
          } else {
            certificatValidation = $('input[name=certificatCondition]').is(':checked')
          }
        }

        if (formValidation === false || certificatValidation === false) {
          e.preventDefault()
        } else {
          // confirmation épreuves
          displayConfirmationEpreuve()

          // Confirmation data
          $('#confirmation-nom').text(nom.val())
          $('#confirmation-prenom').text(prenom.val())
          $('#confirmation-email').text(email.val())
          $('#confirmation-date').text(jourNaissance.val() + '/' + moisNaissance.val() + '/' + anneeNaissance.val())
          $('#confirmation-team').text(team.val())
          $('#confirmation-sex').text(sex.val())
          $('#confirmation-licence').text(numLicence.val())
          $('#confirmation-categorie').text(categorie.val())
          $('#confirmation-adresse1').text(adresse1.val())
          $('#confirmation-adresse2').text(adresse2.val())
          $('#confirmation-codePostal').text(codePostal.val())
          $('#confirmation-city').text(city.val())
          // Action
          $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
          $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
          $('#step-participant').addClass('hidde')
          $('#step-confirmation').removeClass('hidde')
        }
      })

      // Step 2 to 3 from team
      $('#team-form-submit').on('click', (e) => {
        // capitain form validation
        if ($('input[name=capitaine_team]').val() === '') {
          formToComplete($('input[name=capitaine_team]'))
        } else if ($('input[name=capitaine_name]').val() === '') {
          formToComplete($('input[name=capitaine_name]'))
        } else if ($('input[name=capitaine_surname]').val() === '') {
          formToComplete($('input[name=capitaine_surname]'))
        } else if ($('input[name=capitaine_cp]').val() === '') {
          formToComplete($('input[name=capitaine_cp]'))
        } else if ($('input[name=capitaine_city]').val() === '') {
          formToComplete($('input[name=capitaine_city]'))
        } else if ($('input[name=capitaine_email]').val() === '' || emailRegex.test($('input[name=capitaine_email]').val()) === false) {
          formToComplete($('input[name=capitaine_email]'))
        } else {
          // vérification du nombre d'inscrit
          if ($('.team-count').length < Number(teamMin)) {
            window.alert('Le nombre minimum de membres pour cette épreuve est de ' + teamMin)
          } else {
            // member form validation
            var formErreur = 0
            var certificatError = 0
            $('.team-count').each((key, val) => {
              if (key <= Number(teamMin)) {
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
                } else if ($('input[name=membre_birth_year]')[key].value === '') {
                  formErreur += 1
                  formToComplete($($('input[name=membre_birth_year]')[key]))
                } else if ($('input[name=member_email]')[key].value === '') {
                  formErreur += 1
                  formToComplete($($('input[name=member_email]')[key]))
                }
              }
            })

            if ($('input[name=certificat_membre_file]').length >= 1) {
              $('input[name=certificat_membre_file]').each((key, val) => {
                if (val.value === '') {
                  certificatError += 1
                }
              })

              $('input[name=certificatCondition_member]').each((key, val) => {
                if (val.checked === false) {
                  certificatError += 1
                }
              })

              if (certificatError >= 1) {
                window.alert('Merci d\'ajouter le certificat pour chaque participant et de cocher la case d\'acception.')
              }
            }

            if (formErreur === 0 && certificatError === 0) {
              displayConfirmationEpreuve()
              $('#step-team').addClass('hidde')
              $('#step-confirmation').removeClass('hidde')
              $('#participant-form-back').addClass('hidde')
              $('#team-form-back').removeClass('hidde')

              // Confirmation data
              $('#confirmation-nom').text($('input[name=capitaine_name]').val())
              $('#confirmation-prenom').text($('input[name=capitaine_surname]').val())
              $('#confirmation-email').text($('input[name=capitaine_email]').val())
              $('#confirmation-team').text($('input[name=capitaine_team]').val())
              $('#confirmation-codePostal').text($('input[name=capitaine_cp]').val())
              $('#confirmation-city').text($('input[name=capitaine_city]').val())
              $('#header-recap-people').text('Team Manager')

              // remove fields
              $($('#confirmation-date').parent().get(0)).remove()
              $($('#confirmation-sex').parent().get(0)).remove()
              $($('#confirmation-licence').parent().get(0)).remove()
              $($('#confirmation-categorie').parent().get(0)).remove()
              $($('#confirmation-adresse1').parent().get(0)).remove()
              $($('#confirmation-adresse2').parent().get(0)).remove()
              $('input[name=certificatCondition]')[0].required = false

              // Action
              $('#header-participant').removeClass('txt-dark-blue').addClass('text-secondary')
              $('#header-confirmation').removeClass('text-secondary').addClass('txt-dark-blue')
            }
          }
        }
      })

      // Step 3 to 2 particpant
      $('#participant-form-back').on('click', (e) => {
        $('#header-confirmation').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#step-confirmation').addClass('hidde')
        $('#step-participant').removeClass('hidde')
      })

      // Step 3 to 2 team
      $('#team-form-back').on('click', (e) => {
        $('#header-confirmation').removeClass('txt-dark-blue').addClass('text-secondary')
        $('#header-epreuve').removeClass('text-secondary').addClass('txt-dark-blue')
        $('#step-confirmation').addClass('hidde')
        $('#step-team').removeClass('hidde')
      })

      // Step 3 to 4
      $('#checkout').on('click', (e) => {
        // CGV
        if ($('input[name=CGV]').is(':checked') === false) {
          e.preventDefault()
          window.alert("Merci de cocher la case d'acceptation des conditions générales de vente")
        }
      })

      // Date config
      var dateLimite = new Date($('input[name=dateLimite]').val())

      if (dateNow > dateLimite) {
        $('#registration-form').remove()
        $('#divForm').append('<div class="col-sm-12"><p class="alert alert-danger">La date limite d\'inscription à cette épreuve dépassée</p></div>')
      }

      $('#registration-form').on('submit', (e) => {
        var validation = window.confirm('Souhaitez vous valider ces informations?')
        if (!validation) {
          e.preventDefault()
        }
      })
      // form end
    })
  }
}

export default registrationValidation()
