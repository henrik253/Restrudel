setcpm(110/4)

$: s("bd ~ sd ~").bank("LinnDrum").gain(.85)

$: s("~ hh ~ hh").bank("LinnDrum").gain(.22)

$: s("~ cowbell").gain(.25)

$: n("0 3 5 3").scale("a:minor").s("gm_overdriven_guitar").lpf(1500).release(.2).gain(.5)
