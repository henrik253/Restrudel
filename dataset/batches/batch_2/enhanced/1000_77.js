setcpm(105/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("mt mt lt lt mt*2").gain(.3)

$: n("0 3 5 7").scale("d:minor").s("pulse").lpf(1500).gain(.4)

$: n("<0 3 5>").scale("d:minor").s("gm_electric_guitar_jazz").release(.2).gain(.35)
