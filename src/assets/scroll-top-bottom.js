addEventListener("DOMContentLoaded", (event) => {
    const style = document.createElement('style');
    style.innerHTML = `
			.scrolltop,
            .scrollbottom {
            	display: none;
            	width: 100%;
            	margin: 0 auto;
            	position: fixed;
            	right: 10px;
            }

            .scrolltop {
            	bottom: 10px;
            }

            .scrollbottom {
            	top: 10px;
            }

            .scrolltop .scroll,
            .scrollbottom .scroll {
            	position: absolute;
            	right: 0px;
            	padding: 5px;
            	text-align: center;
            	margin: 0 0 0 0;
            	cursor: pointer;
            	z-index: 999;
            }

            .scrolltop .scroll {
            	bottom: 0px;
            }

            .scrollbottom .scroll {
            	top: 0px;
            }

            .scrolltop .scroll *,
            .scrollbottom .scroll * {
            	font-size: 28px;
            }
		`;
    document.head.appendChild(style);

    document.body.insertAdjacentHTML('afterbegin', "<div class='thetop'></div>\n" +
        "<div class='scrollbottom'>\n" +
        "\t<div class='scroll icon'>\n" +
        "\t\t<i class=\"icon-as-button fa-solid fa-circle-arrow-down\"></i>\n" +
        "\t</div>\n" +
        "</div>");
    document.body.insertAdjacentHTML('beforeend', "<div class='scrolltop'>\n" +
        "\t<div class='scroll icon'>\n" +
        "\t\t<i class=\"icon-as-button fa-solid fa-circle-arrow-up\"></i>\n" +
        "\t</div>\n" +
        "</div>\n" +
        "<div class='thebottom'></div>");

    function scrollFunction() {
        const scrollTopValue = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTopValue > 50) {
            $('.scrolltop:hidden').stop(true, true).fadeIn();
        } else {
            $('.scrolltop').stop(true, true).fadeOut();
        }

        if ((window.innerHeight + window.scrollY) >= ( document.body.offsetHeight - 50)) {
            $('.scrollbottom').stop(true, true).fadeOut();
        } else {
            $('.scrollbottom:hidden').stop(true, true).fadeIn();
        }
    }
    scrollFunction();
    $(window).scroll(() => {
        scrollFunction();
    });

    $(".scrolltop .scroll").click(() => {
        $("html,body").animate({scrollTop: $(".thetop").offset().top}, "0");
        return false;
    });
    $(".scrollbottom .scroll").click(() => {
        $("html, body").animate({scrollTop: $(document).height()}, "slow");
        return false;
    });

});