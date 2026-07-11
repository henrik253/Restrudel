setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2)

$: n("0 3 5 7").scale("c:major").s("gm_piano").release(.2).gain(.4)

$: n("<0 3 5 7>").scale("c:major").s("gm_pizzicato_strings").gain(.35).room(.4)
