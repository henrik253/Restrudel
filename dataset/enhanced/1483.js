setcpm(112/4)

$: note("g2 ~ eb2 f2 ~ g2 c3 ~").s("sawtooth").lpf(500).room(.4).release(.2).gain(.5)

$: note("~ [g3,bb3] ~ [f3,a3]").s("clavisynth").delay(.3).release(.2).gain(.35)

$: n("<7 9 7 [5 4]>").scale("g:minor").s("gm_ocarina").release(.3).room(.5).gain(.3)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: s("~ gm_distortion_guitar:3 ~ ~").slow(2).gain(.3).room(.5)
