setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("clave*4").gain(.3)

$: n("0 3 5 3").scale("e:minor").s("rect").lpf(1200).gain(.4)

$: n("<0 3 5>").scale("e:minor").s("gm_acoustic_guitar_steel").release(.3).gain(.4)
