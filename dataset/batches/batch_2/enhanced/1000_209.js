setcpm(118/4)

$: s("bd!2 ~ sd ~").bank("RolandTR808").gain(.8)

$: s("sleighbells*4").slow(2).gain(.25)

$: note("a#4 g#4 c#4 ~").sound("piano").lpf(1500).room(.6).gain(.4)

$: n("0 -7").scale("c:<major minor>/2").s("sawtooth").transpose("<0 1 2 1>/8").lpf(1000).gain(.35)
