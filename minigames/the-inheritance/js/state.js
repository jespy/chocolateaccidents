(function(){
  const evidenceCatalog={
    will:['The Changed Will','Arthur leaves the estate to a medical research trust controlled by Dr. Lena Voss.'],
    whiskey:['Drugged Whiskey','A medicinal residue clings to Arthur’s glass—and to your memory.'],
    frame:['Broken Photograph','Elena’s family photograph was smashed during an argument.'],
    voicemail:['Elena’s Voicemail','Elena left angry, but her later message places her away from the murder.'],
    journal:['Arthur’s Journal','Arthur feared Lena was pressuring him over his will and insurance.'],
    computer:['Insurance Email','Lena is beneficiary of Arthur’s two-million-dollar policy.'],
    safe:['Unsigned Codicil','Arthur planned to remove Lena and restore Elena as beneficiary.'],
    prescription:['Sedative Bottle','Lena prescribed the sedative used on Arthur—and likely Marcus.'],
    receipt:['Elena’s Receipt','Takeout timestamped 9:18 PM, across town, supports Elena’s alibi.'],
    weapon:['Brass Candlestick','Blood and a torn blue medical glove cling to the hidden weapon.']
  };
  window.GameState={
    inventory:new Set(),evidence:new Set(),flags:{},catalog:evidenceCatalog,
    reset(){this.inventory.clear();this.evidence.clear();this.flags={};},
    addItem(item){this.inventory.add(item);window.UI?.refresh();},
    has(item){return this.inventory.has(item);},
    addEvidence(id){if(!this.evidence.has(id)){this.evidence.add(id);window.AudioFX?.sting();window.UI?.toast('EVIDENCE RECORDED');}window.UI?.refresh();},
    knowsTruth(){return ['will','journal','computer','safe','prescription','receipt','weapon'].every(x=>this.evidence.has(x));}
  };
})();
