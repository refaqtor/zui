/**
 * This file is part of the "FnordMetric" project
 *   Copyright (c) 2014 Laura Schlimmer
 *   Copyright (c) 2014 Paul Asmuth, Google Inc.
 *
 * FnordMetric is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License v3.0. You should have received a
 * copy of the GNU General Public License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 */

var CheckBoxComponent = function() {
  this.createdCallback = function() {

    this.addEventListener('click', function() {

     if (this.hasAttribute('data-active')) {
        this.removeAttribute('data-active');

        var ev = new CustomEvent("z-checkbox-unselect", {
            bubbles: true,
            cancelable: true
        });
        this.dispatchEvent(ev);

      } else {
        this.setAttribute('data-active', 'active');


        var ev = new CustomEvent("z-checkbox-select", {
            bubbles: true,
            cancelable: true
        });
        this.dispatchEvent(ev);
      }

    }, false);
  };
};

var proto = Object.create(HTMLElement.prototype);
CheckBoxComponent.apply(proto);
document.registerElement("z-checkbox", { prototype: proto });
