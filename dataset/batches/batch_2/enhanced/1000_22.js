setcpm(108/4)
$: s("bd:1*2 ~ bd:1*2 ~").slow(2).gain(.8)
$: note("a#5 g#5 e5 c#5 ~ b4 f#5").s("gm_lead_6_voice").gain(.4)
$: s("gm_drawbar_organ ~").note("c d").segment(8).slow(8).gain(.4).room(.5)
