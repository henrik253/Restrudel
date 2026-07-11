setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd*4").gain(.4)

$: s("~ cymbal ~ ~").gain(.3)

$: n("-3 ~ -4 ~ -5 ~").scale("f:minor").s("recorder_bass_sus")
  .room(.3).release(.3).gain(.4)

$: n("<f2 c2 db2 eb2>").scale("f:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
