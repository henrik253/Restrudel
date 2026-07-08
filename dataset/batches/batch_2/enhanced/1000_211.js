setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandMT32").gain(.8)

$: s("hh!4 lt").bank("RolandMT32").gain(.3)

$: s("cr ~").slow(2).gain(.3)

$: n("0 3 5 7").scale("e:minor").s("sawtooth").lpf(1000).release(.25).gain(.35)
