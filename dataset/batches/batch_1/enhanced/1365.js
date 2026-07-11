setcpm(120/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.85)

$: s("linndrum_hh oh:2*8").gain(.4).release(.1).attack(.01)

$: note("a1 f1 c2 g1").s("sawtooth").lpf(600).release(.2).gain(.4)

$: s("supersaw ~ supersaw ~").note("<a3 c4 e4>").clip(.9).lpf(1600).room(.3).gain(.4)
