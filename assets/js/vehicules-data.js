/**
 * Marques et modèles courants du marché français — Garage de la Chapelle
 * Utilisé par les formulaires « Ajouter un véhicule » et « Devis » :
 * le choix d'une marque propose la liste de ses modèles.
 */
window.GLC_MODELS = {
  'Peugeot': ['106', '107', '108', '206', '207', '208', '2008', '306', '307', '308', '3008', '407', '408', '508', '5008', 'Partner', 'Rifter', 'Expert', 'Boxer'],
  'Renault': ['Twingo', 'Clio', 'Captur', 'Mégane', 'Scénic', 'Kadjar', 'Arkana', 'Austral', 'Talisman', 'Laguna', 'Espace', 'Zoé', 'Kangoo', 'Trafic', 'Master'],
  'Citroën': ['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Picasso', 'C5', 'C5 Aircross', 'Berlingo', 'Jumpy', 'Jumper', 'Xsara', 'Saxo'],
  'Dacia': ['Sandero', 'Duster', 'Logan', 'Spring', 'Jogger', 'Lodgy', 'Dokker'],
  'Volkswagen': ['Up!', 'Polo', 'Golf', 'Passat', 'Arteon', 'T-Roc', 'T-Cross', 'Tiguan', 'Touran', 'Touareg', 'Caddy', 'Transporter', 'Scirocco'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'TT'],
  'BMW': ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'X1', 'X2', 'X3', 'X5', 'Z4'],
  'Mercedes': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'CLA', 'GLA', 'GLB', 'GLC', 'Vito', 'Sprinter'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia', 'Zafira', 'Meriva'],
  'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mondeo', 'C-Max', 'S-Max', 'EcoSport', 'Ranger', 'Transit'],
  'Fiat': ['500', 'Panda', 'Punto', 'Tipo', 'Doblo', 'Ducato'],
  'Toyota': ['Aygo', 'Yaris', 'Yaris Cross', 'Corolla', 'C-HR', 'RAV4', 'Auris', 'Prius', 'Hilux', 'Proace'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Navara'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Stonic', 'Sorento'],
  'Hyundai': ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe', 'Ioniq'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Alhambra'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq'],
};

/**
 * Branche un sélecteur de modèles dépendant de la marque.
 * Le champ texte reste porteur de la valeur (compatible avec `required`) ;
 * le <select> n'est qu'une aide à la saisie, avec « Autre modèle… » en repli.
 */
window.setupModelPicker = function (brandSel, modelSel, modelInput) {
  function refresh(preserve) {
    const models = window.GLC_MODELS[brandSel.value];
    if (models) {
      modelSel.innerHTML = '<option value="">Sélectionnez un modèle…</option>'
        + models.map(m => `<option value="${m}">${m}</option>`).join('')
        + '<option value="__autre">Autre modèle…</option>';
      modelSel.style.display = '';
      if (preserve && models.includes(preserve)) {
        modelSel.value = preserve;
        modelInput.value = preserve;
        modelInput.style.display = 'none';
      } else if (preserve) {
        modelSel.value = '__autre';
        modelInput.value = preserve;
        modelInput.style.display = '';
      } else {
        modelSel.value = '';
        modelInput.value = '';
        modelInput.style.display = 'none';
      }
    } else {
      // marque inconnue ou « Autre » : saisie libre
      modelSel.style.display = 'none';
      modelInput.style.display = '';
      if (preserve !== undefined) modelInput.value = preserve || '';
    }
  }

  brandSel.addEventListener('change', () => refresh());
  modelSel.addEventListener('change', () => {
    if (modelSel.value === '__autre') {
      modelInput.value = '';
      modelInput.style.display = '';
      modelInput.focus();
    } else {
      modelInput.value = modelSel.value;
      modelInput.style.display = 'none';
    }
  });

  refresh(modelInput.value || undefined);
  return { refresh };
};
