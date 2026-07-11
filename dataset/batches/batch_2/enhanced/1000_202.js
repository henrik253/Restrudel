setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh oh hh oh").lpf(1200).resonance(8).gain(.2)

$: note("g4 c5 ~ g4 ~ ~ b3 ~ d4 g4 ~ d4 ~").sound("triangle").lpf(3000).room(1).delay(.3).gain(.35)

$: n("0 3 5 7").scale("g:minor").s("sawtooth").lpf(900).release(.2).gain(.4)
