setcpm(104/4)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.85)

$: s("~ snare ~ snare").room(.7024).gain(.3536)

$: n("7 11 11 10 ~").scale("c:bebop major").sound("gm_baritone_sax").slow(2).gain(.5)

$: note("<c2 g1>").sound("sawtooth").slow(2).lpf(700).release(.2).gain(.4)
