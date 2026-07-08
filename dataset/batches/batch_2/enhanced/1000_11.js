setcpm(96/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: n("3 4 3 2").scale("d:minor").s("gm_baritone_sax").clip(.95).release(.15).distort("5:.3").room(.6).gain(.5)
$: note("d#5@2 d5@2 c#5@2 d5").s("sawtooth").lpf(2000).gain(.35).room(.4)
