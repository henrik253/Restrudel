setcpm(98/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("d#5@2 d5@2").s("sawtooth")
  .lpf("<200 400 1000 1500>").release(.3).delay(.3).gain(.35)

$: note("d#2 a#1 d#2 c2").s("gm_string_ensemble_1").lpf(700)
  .release(.3).room(.4).gain(.4)
